const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_MAX_CONTENT_LENGTH = 25 * 1024 * 1024;
const DEFAULT_MAX_BODY_LENGTH = 25 * 1024 * 1024;

const CACHE_DIRECTORY = path.join(__dirname, "cache");

const SUCCESS_STATUS = "success";

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/avif"
]);

const MIME_TO_EXTENSION = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/avif": "avif"
};

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const createRequestId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 12)}`;
  }
};

const normalizeBaseUrl = apiUrl => {
  if (typeof apiUrl !== "string") {
    return "";
  }

  return apiUrl.trim().replace(/\/+$/, "");
};

const normalizeString = value => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
};

const safeArray = value => {
  return Array.isArray(value) ? value : [];
};

const safeObject = value => {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value;
};

const getFileExtensionFromMime = mimeType => {
  if (!mimeType) {
    return "bin";
  }

  const normalized = String(mimeType)
    .toLowerCase()
    .split(";")[0]
    .trim();

  return MIME_TO_EXTENSION[normalized] || "bin";
};

const sanitizeFilePart = value => {
  return String(value || "command")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80);
};

const isValidBase64 = value => {
  if (typeof value !== "string") {
    return false;
  }

  if (!value.length) {
    return false;
  }

  const normalized = value.replace(/\s/g, "");

  if (!normalized.length) {
    return false;
  }

  if (normalized.length % 4 !== 0) {
    return false;
  }

  return /^[A-Za-z0-9+/]*={0,2}$/.test(normalized);
};

const decodeBase64Image = value => {
  if (!isValidBase64(value)) {
    throw new Error("Invalid base64 image data.");
  }

  return Buffer.from(value, "base64");
};

const getMimeType = value => {
  if (!value) {
    return "image/png";
  }

  return String(value)
    .toLowerCase()
    .split(";")[0]
    .trim();
};

const isImageResponse = data => {
  return Boolean(
    data &&
    data.type === "image" &&
    data.image
  );
};

const createFallbackMessage = data => {
  if (
    data &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return "❌ Command execution failed.";
};

const createSuccessMessage = data => {
  if (
    data &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return "✅ Done.";
};

const extractAttachment = attachment => {
  if (!attachment || typeof attachment !== "object") {
    return null;
  }

  return {
    type: attachment.type || null,
    url: attachment.url || null,
    ID: attachment.ID || attachment.id || null,
    id: attachment.id || attachment.ID || null,
    name: attachment.name || null,
    filename: attachment.filename || null,
    width: attachment.width || null,
    height: attachment.height || null,
    duration: attachment.duration || null,
    description: attachment.description || null
  };
};

const extractAttachments = attachments => {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .map(extractAttachment)
    .filter(Boolean);
};

const extractMessageReply = messageReply => {
  if (!messageReply) {
    return null;
  }

  return {
    senderID: messageReply.senderID || null,
    body: messageReply.body || "",
    messageID: messageReply.messageID || null,
    attachments: extractAttachments(
      messageReply.attachments
    ),
    mentions: safeObject(
      messageReply.mentions
    )
  };
};

const buildEventPayload = event => {
  const safeEvent = event || {};

  return {
    type: safeEvent.type || null,

    senderID:
      safeEvent.senderID ||
      safeEvent.author ||
      null,

    threadID:
      safeEvent.threadID ||
      null,

    messageID:
      safeEvent.messageID ||
      null,

    body:
      typeof safeEvent.body === "string"
        ? safeEvent.body
        : "",

    messageReply:
      extractMessageReply(
        safeEvent.messageReply
      ),

    mentions:
      safeObject(safeEvent.mentions),

    attachments:
      extractAttachments(
        safeEvent.attachments
      ),

    isGroup:
      typeof safeEvent.isGroup === "boolean"
        ? safeEvent.isGroup
        : null,

    timestamp:
      safeEvent.timestamp ||
      Date.now()
  };
};

const buildInputPayload = ({
  args,
  event,
  commandName,
  requestId
}) => {
  const replyAttachments =
    event?.messageReply?.attachments || [];

  const firstReplyAttachment =
    replyAttachments[0] || null;

  const imageUrl =
    firstReplyAttachment?.url || null;

  return {
    uptime: process.uptime(),

    command:
      commandName || null,

    requestId,

    args:
      safeArray(args),

    rawArgs:
      safeArray(args).join(" "),

    imgUrl:
      imageUrl,

    imageUrl:
      imageUrl,

    hasReply:
      Boolean(event?.messageReply),

    hasAttachments:
      Boolean(
        event?.attachments?.length ||
        replyAttachments.length
      ),

    replyAttachmentCount:
      replyAttachments.length,

    attachmentCount:
      safeArray(event?.attachments).length
  };
};

const buildRequestPayload = ({
  args,
  event,
  commandName,
  requestId
}) => {
  const normalizedArgs = safeArray(args);

  return {
    args: normalizedArgs,

    event: buildEventPayload(event),

    input: buildInputPayload({
      args: normalizedArgs,
      event,
      commandName,
      requestId
    })
  };
};

const getErrorCode = error => {
  return error?.code || null;
};

const getErrorMessage = error => {
  if (!error) {
    return "Unknown error";
  }

  if (
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return String(error);
};

const isTimeoutError = error => {
  const code = getErrorCode(error);

  return (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    code === "ESOCKETTIMEDOUT" ||
    error?.code === "ERR_CANCELED"
  );
};

const isNetworkError = error => {
  const code = getErrorCode(error);

  return [
    "ENOTFOUND",
    "ECONNREFUSED",
    "ECONNRESET",
    "EHOSTUNREACH",
    "EAI_AGAIN",
    "ENETUNREACH"
  ].includes(code);
};

const getHttpStatus = error => {
  return (
    error?.response?.status ||
    error?.status ||
    null
  );
};

const getHttpResponseData = error => {
  return error?.response?.data || null;
};

const createErrorLog = ({
  commandName,
  requestId,
  error
}) => {
  return {
    command:
      commandName || "unknown",

    requestId:
      requestId || "unknown",

    code:
      getErrorCode(error),

    status:
      getHttpStatus(error),

    message:
      getErrorMessage(error),

    network:
      isNetworkError(error),

    timeout:
      isTimeoutError(error)
  };
};

const logError = ({
  commandName,
  requestId,
  error
}) => {
  console.error(
    `[RemoteCommand:${commandName}]`,
    createErrorLog({
      commandName,
      requestId,
      error
    })
  );
};

const validateApiResponse = data => {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      reason: "Invalid API response."
    };
  }

  if (data.status !== SUCCESS_STATUS) {
    return {
      valid: false,
      reason:
        typeof data.message === "string"
          ? data.message
          : "Unknown API error."
    };
  }

  return {
    valid: true,
    reason: null
  };
};

const validateImageResponse = data => {
  if (!isImageResponse(data)) {
    return {
      valid: false,
      reason: "Invalid image response."
    };
  }

  if (!isValidBase64(data.image)) {
    return {
      valid: false,
      reason: "Invalid image data."
    };
  }

  return {
    valid: true,
    reason: null
  };
};

const ensureCacheDirectory = async () => {
  await fs.ensureDir(
    CACHE_DIRECTORY
  );

  return CACHE_DIRECTORY;
};

const createImageFilePath = ({
  commandName,
  mimeType,
  requestId
}) => {
  const extension =
    getFileExtensionFromMime(mimeType);

  const safeCommand =
    sanitizeFilePart(commandName);

  const safeRequest =
    sanitizeFilePart(requestId);

  return path.join(
    CACHE_DIRECTORY,
    `cmd_${safeCommand}_${safeRequest}_${Date.now()}.${extension}`
  );
};

const writeImageToCache = async ({
  image,
  commandName,
  mimeType,
  requestId
}) => {
  await ensureCacheDirectory();

  const imageBuffer =
    decodeBase64Image(image);

  const filePath =
    createImageFilePath({
      commandName,
      mimeType,
      requestId
    });

  await fs.writeFile(
    filePath,
    imageBuffer
  );

  return {
    filePath,
    size: imageBuffer.length
  };
};

const removeFileSafely = async filePath => {
  if (!filePath) {
    return;
  }

  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error(
      "[RemoteCommand] Cache cleanup failed:",
      error?.message || error
    );
  }
};

const sendImageResponse = async ({
  api,
  event,
  data,
  commandName,
  requestId
}) => {
  const mimeType =
    getMimeType(
      data.mimeType
    );

  const validation =
    validateImageResponse(data);

  if (!validation.valid) {
    throw new Error(
      validation.reason
    );
  }

  const {
    filePath
  } = await writeImageToCache({
    image: data.image,
    commandName,
    mimeType,
    requestId
  });

  try {
    return await new Promise(
      (resolve, reject) => {
        let completed = false;

        const cleanup = async () => {
          await removeFileSafely(
            filePath
          );
        };

        const done = async (
          error,
          result
        ) => {
          if (completed) {
            return;
          }

          completed = true;

          await cleanup();

          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        };

        try {
          const result =
            api.sendMessage(
              {
                body:
                  data.message || "",

                attachment:
                  fs.createReadStream(
                    filePath
                  )
              },

              event.threadID,

              error => {
                done(
                  error,
                  undefined
                );
              },

              event.messageID
            );

          if (
            result &&
            typeof result.then ===
              "function"
          ) {
            result
              .then(async value => {
                if (!completed) {
                  completed = true;

                  await cleanup();

                  resolve(value);
                }
              })
              .catch(async error => {
                if (!completed) {
                  completed = true;

                  await cleanup();

                  reject(error);
                }
              });
          }
        } catch (error) {
          done(
            error,
            undefined
          );
        }
      }
    );
  } catch (error) {
    await removeFileSafely(
      filePath
    );

    throw error;
  }
};

const sendReply = async ({
  message,
  text
}) => {
  if (
    message &&
    typeof message.reply ===
      "function"
  ) {
    return message.reply(
      text || ""
    );
  }

  return null;
};

const createAxiosClient = ({
  baseUrl,
  timeout
}) => {
  return axios.create({
    baseURL: baseUrl,

    timeout:
      Number.isFinite(timeout) &&
      timeout > 0
        ? timeout
        : DEFAULT_TIMEOUT,

    maxContentLength:
      DEFAULT_MAX_CONTENT_LENGTH,

    maxBodyLength:
      DEFAULT_MAX_BODY_LENGTH,

    headers: {
      Accept:
        "application/json",

      "Content-Type":
        "application/json",

      "User-Agent":
        "Maruf-RemoteCommand/1.0"
    },

    validateStatus:
      status =>
        status >= 200 &&
        status < 500
  });
};

const postCommand = async ({
  client,
  commandName,
  payload
}) => {
  const encodedName =
    encodeURIComponent(
      commandName
    );

  return client.post(
    `/commands/${encodedName}`,
    payload
  );
};

const getResponseData = response => {
  if (!response) {
    return null;
  }

  return response.data;
};

const handleApiFailure = async ({
  message,
  data,
  status
}) => {
  console.error(
    "[RemoteCommand] API failure:",
    {
      status,
      message:
        data?.message ||
        "Unknown error"
    }
  );

  return sendReply({
    message,

    text:
      "❌ এই Command-টি এখন কাজ করছে না.\n\n» একটু পরে আবার চেষ্টা করো। 😿"
  });
};

const handleTimeout = async ({
  message
}) => {
  return sendReply({
    message,

    text:
      "⏳ Command-টি উত্তর দিতে দেরি করছে.\n\n» একটু পরে আবার চেষ্টা করো। 😿"
  });
};

const handleNetworkError = async ({
  message
}) => {
  return sendReply({
    message,

    text:
      "🌐 Command server-এর সাথে যোগাযোগ করা যাচ্ছে না.\n\n» কিছুক্ষণ পরে আবার চেষ্টা করো। 😿"
  });
};

const handleGenericError = async ({
  message
}) => {
  return sendReply({
    message,

    text:
      "❌ এই Command-টি বর্তমানে ব্যবহার করা যাচ্ছে না.\n\n» কিছুক্ষণ পরে আবার চেষ্টা করো। 😿"
  });
};

const createCommandHandler = (
  apiUrl,
  commandName,
  options = {}
) => {
  const timeout =
    Number(options.timeout) > 0
      ? Number(options.timeout)
      : DEFAULT_TIMEOUT;

  const baseUrl =
    normalizeBaseUrl(apiUrl);

  const client =
    baseUrl
      ? createAxiosClient({
          baseUrl,
          timeout
        })
      : null;

  return {
    onStart: async function (
      context
    ) {
      const {
        api,
        event,
        args,
        message
      } = context || {};

      const requestId =
        createRequestId();

      try {
        if (!baseUrl) {
          return sendReply({
            message,

            text:
              "❌ Command configuration পাওয়া যায়নি।"
          });
        }

        if (
          !commandName ||
          typeof commandName !==
            "string"
        ) {
          return sendReply({
            message,

            text:
              "❌ Command name পাওয়া যায়নি।"
          });
        }

        const normalizedArgs =
          safeArray(args);

        const payload =
          buildRequestPayload({
            args:
              normalizedArgs,

            event,

            commandName,

            requestId
          });

        const response =
          await postCommand({
            client,

            commandName,

            payload
          });

        const status =
          response?.status;

        const data =
          getResponseData(
            response
          );

        if (
          status >= 400 ||
          !data
        ) {
          return handleApiFailure({
            message,

            data,

            status
          });
        }

        const validation =
          validateApiResponse(
            data
          );

        if (!validation.valid) {
          console.error(
            `[Command:${commandName}]`,
            data?.message ||
              validation.reason
          );

          return sendReply({
            message,

            text:
              "❌ এই Command-টি এখন কাজ করছে না.\n\n» একটু পরে আবার চেষ্টা করো। 😿"
          });
        }

        if (
          data.type === "image"
        ) {
          if (
            !data.image
          ) {
            console.error(
              `[Command:${commandName}] Image response missing image data.`
            );

            return sendReply({
              message,

              text:
                "❌ Image পাওয়া যায়নি.\n\n» একটু পরে আবার চেষ্টা করো। 😿"
            });
          }

          return await sendImageResponse({
            api,

            event,

            data,

            commandName,

            requestId
          });
        }

        return sendReply({
          message,

          text:
            createSuccessMessage(
              data
            )
        });
      } catch (error) {
        logError({
          commandName,

          requestId,

          error
        });

        if (
          isTimeoutError(error)
        ) {
          return handleTimeout({
            message
          });
        }

        if (
          isNetworkError(error)
        ) {
          return handleNetworkError({
            message
          });
        }

        return handleGenericError({
          message
        });
      }
    }
  };
};

const remoteCommand = (
  apiUrl,
  commandName,
  options = {}
) => {
  return createCommandHandler(
    apiUrl,
    commandName,
    options
  );
};

remoteCommand.version =
  "2.0.0";

remoteCommand.defaults = {
  timeout:
    DEFAULT_TIMEOUT,

  maxContentLength:
    DEFAULT_MAX_CONTENT_LENGTH,

  maxBodyLength:
    DEFAULT_MAX_BODY_LENGTH
};

module.exports =
  remoteCommand;