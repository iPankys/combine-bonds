import SessionModel from "@/server/models/session.schema";
import { verifyIDPassword } from "@/server/services/portfolio.service";
import { SessionInterface, SessionInterfaceWithId } from "@/types/session.interface";
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const initVector = crypto.randomBytes(16);
const key = crypto.randomBytes(32);
const cipher = crypto.createCipheriv(algorithm, key, initVector);
const decipher = crypto.createDecipheriv(algorithm, key, initVector);


const SECRET_KEY = process.env.SESSION_SECRET_KEY || "khandar-estrada-khandos-indactu";

function encrypt(text: string) {
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(text: string) {
    let decrypted = decipher.update(text, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

export async function addSession(name: string, password: string) {
    const { portfolio, message } = await verifyIDPassword(name, password);
    if (!portfolio) { return { session: null, message }; }
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 1);
    try {
        const newSession = new SessionModel({
            portfolio,
            expiration,
        });
        const session_document = await newSession.save() as SessionInterfaceWithId;
        const session = {
            _id: String(session_document._id),
            portfolio: String(session_document.portfolio),
            expiration: session_document.expiration,
        };
        console.log(session);
        const encryptedSessionID = encrypt(session._id);
        return {
            message, session: {
                ...session,
                _id: encryptedSessionID,
            }
        }
    }
    catch (err: any) {
        if (err.code == 11000) {
            return { session: null, message: "Session already exists" };
        }
        else {
            return { session: null, message: err.message };
        }
    }
};

export async function getSessionById(encryptedSessionID: string) {
    const session_id = decrypt(encryptedSessionID);
    const session = await SessionModel.findById(session_id).exec() as SessionInterfaceWithId;
    session._id = String(session._id);
    session.portfolio = String(session.portfolio);
    if (session.expiration < new Date()) {
        await deleteSessionById(encryptedSessionID);
        return null;
    }
    return {
        ...session,
        _id: encryptedSessionID,
    };
};

export async function deleteSessionById(encryptedSessionID: string) {
    const session_id = decrypt(encryptedSessionID);
    return await SessionModel.findByIdAndDelete(session_id).exec() as SessionInterface;
};