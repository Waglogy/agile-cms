export const LOGIN_URL = "/login";
export const LOGOUT_URL = "/logout";

//#region Public URLs

export const EMPLOYEE_CONFIG_URL = "";

//#region System Admin URLs

// Master Gender System Admin
export const MASTER_GENDER_CONFIG_URL = "/systemAdmin/masterGenderConfig";

//#endregion

//#region Content Admin URLs
export const CONTENT_ADMIN_CREATE_COLLECTION = "/api/collection/create";
export const CONTENT_ADMIN_DELETE_COLLECTION = "/api/collection/delete-collection";
export const CONTENT_ADMIN_ALTER_TABLE = "/api/collection/alter";
//#endregion

//#region Content Manager URLs
export const CONTENT_MANAGER_GET_CONTENT = "/contentManager/getContent";
export const CONTENT_MANAGER_UPDATE_CONTENT = "/contentManager/updateContent";
export const CONTENT_MANAGER_DELETE_CONTENT = "/contentManager/deleteContent";

// Collection Data Operations
export const CONTENT_MANAGER_GET_COLLECTIONS = "/api/collection";
export const CONTENT_MANAGER_GET_COLLECTION_DATA = "/api/collection/data";
export const CONTENT_MANAGER_INSERT_DATA = "/api/collection/insert";
export const CONTENT_MANAGER_UPDATE_DATA = "/api/collection/update";
export const CONTENT_MANAGER_DELETE_DATA = "/api/collection/delete";

// Content Types
export const CONTENT_MANAGER_GET_CONTENT_TYPES = "/contentManager/getContentTypes";
export const CONTENT_MANAGER_CREATE_CONTENT_TYPE = "/contentManager/createContentType";
export const CONTENT_MANAGER_UPDATE_CONTENT_TYPE = "/contentManager/updateContentType";
export const CONTENT_MANAGER_DELETE_CONTENT_TYPE = "/contentManager/deleteContentType";

// Media Management
export const CONTENT_MANAGER_UPLOAD_MEDIA = "/contentManager/uploadMedia";
export const CONTENT_MANAGER_DELETE_MEDIA = "/contentManager/deleteMedia";
export const CONTENT_MANAGER_GET_MEDIA = "/contentManager/getMedia";
//#endregion
