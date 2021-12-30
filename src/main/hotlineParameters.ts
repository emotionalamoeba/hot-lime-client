export interface Parameter {
    id: number;
    content: number | string;

    size(): number;
    writeContent(data: Buffer, byteOffset: number): number;
    readFromBytes(data: Buffer, byteOffset: number, byteLength: number): number;
}

/*
class ByteParameter implements Parameter {
    id: number;
    content: number;

    constructor(id: number, value: number) {
        this.id = id;
        this.content = value;
    }

    size = (): number => {
        return 1;
    }

    writeContent = (data: Buffer, byteOffset: number): number => {
        data.writeUInt8(this.content, byteOffset);
        return byteOffset + 1;
    }
}*/

class IntParameter implements Parameter {
    id: number;
    content: number;

    constructor(id: number, value: number) {
        this.id = id;
        this.content = value;
    }

    size = (): number => {
        return 4;
    }

    writeContent = (data: Buffer, byteOffset: number): number => {
        data.writeUInt32BE(this.content, byteOffset);
        return byteOffset + 4;
    }

    readFromBytes(data: Buffer, byteOffset: number, byteLength: number): number {
        this.content = data.readUInt16BE(byteOffset);
        return byteOffset + 2;
    }
}

class TextParameter implements Parameter {
    id: number;
    content: string;

    constructor(id: number, text: string) {
        this.id = id;
        this.content = text;
    }

    readFromBytes(data: Buffer, byteOffset: number, byteLength: number): number {
        let fieldData: string = '';

        let b = 0;
        while (b < byteLength) {
            fieldData += String.fromCharCode(data.readUInt8(byteOffset));
            byteOffset++;
            b++;
        }

        this.content = fieldData;

        return byteOffset;
    }

    size = (): number => {
        return this.content.length;
    }

    writeContent = (data: Buffer, byteOffset: number): number => {
        for (let i = 0; i < this.content.length; i++) {
            data.writeUInt8(this.content.charCodeAt(i), byteOffset); byteOffset++;
        }

        return byteOffset;
    }
}

class UserNameWithInfoParameter implements Parameter {
    id: number;
    content: string | number;

    userID: number;
    iconID: number;
    userFlags: number;
    userName: string;

    constructor(id: number) {
        this.id = id;
    }

    size(): number {
        throw new Error("Method not implemented.");
    }
    writeContent(data: Buffer, byteOffset: number): number {
        throw new Error("Method not implemented.");
    }
    readFromBytes(data: Buffer, byteOffset: number, byteLength: number): number {
        this.userName = '';
        let b = 0;
        this.userID = data.readUInt16BE(byteOffset); b += 2; byteOffset += 2;
        this.iconID = data.readUInt16BE(byteOffset); b += 2; byteOffset += 2;
        this.userFlags = data.readUInt16BE(byteOffset); b += 2; byteOffset += 2;
        let lengthO = data.readUInt16BE(byteOffset); b += 2; byteOffset += 2;

        //console.log(`socket ${socket} : icon ${icon} : status ${status}`);

        while (b < byteLength) {
            this.userName += String.fromCharCode(data.readUInt8(byteOffset)); byteOffset += 1;
            b++;
        }

        // console.log(`Parameter ${parameterIndex} field ID ${fieldID} : Text ${fieldData2}`);


        return byteOffset;
    }

}

export { TextParameter, IntParameter, UserNameWithInfoParameter }