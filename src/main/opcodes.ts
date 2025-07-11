export const opcodes = {
    'SERVER_PRIVATE_MESSAGE': 104,
    'SERVER_PUBLIC_MESSAGE': 106,
    'SERVER_SHOW_AGREEMENT': 109,

    'ACCEPT_AGREEMENT': 121,

    'CLIENT_PUBLIC_CHAT': 105,
    'CLIENT_LOGIN': 107,
    'CLIENT_GET_USER_NAME_LIST': 300,
    'SERVER_NOTIFY_CHANGE_USER': 301,
    'SERVER_NOTIFY_DELETE_USER': 302,

    'SERVER_USER_ACCESS': 354
};

export const opcodeNames = {
    104: 'SERVER_PRIVATE_MESSAGE',
    106: 'SERVER_PUBLIC_MESSAGE',
    107: 'CLIENT_LOGIN',
    109: 'SERVER_SHOW_AGREEMENT',

    121: 'ACCEPT_AGREEMENT',

    105: 'CLIENT_PUBLIC_CHAT',
    300: 'CLIENT_GET_USER_NAME_LIST',
    301: 'SERVER_NOTIFY_CHANGE_USER',
    302: 'SERVER_NOTIFY_DELETE_USER',

    354: 'SERVER_USER_ACCESS'
};

export const paramcodes = {
    'DATA': 101,
    'USER_NAME': 102,
    'USER_ID': 103,
    'USER_ICON_ID': 104,
    'USER_ACCESS': 110,
    'OPTIONS': 113,
    'CHAT_ID': 114,
    'USER_NAME_WITH_INFO': 300
}