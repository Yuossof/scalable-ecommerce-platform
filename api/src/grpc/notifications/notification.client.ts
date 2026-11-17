
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { promisify } from "node:util";

const PROTO_PATH = path.resolve(
    process.cwd(),
    "proto/notification.proto"
);

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: false,
        defaults: true,
        oneofs: true,
    }
);

const proto = grpc.loadPackageDefinition(
    packageDefinition
) as any;

const client = new proto.notification.NotificationService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

const sendNotification = promisify(
    client.sendNotification.bind(client)
);

export interface NotificationResponse {
    success: boolean;
    message: string;
}

export async function notifyUser(data: {
    userId: string;
    title: string;
    body: string;
}): Promise<NotificationResponse> {
    return sendNotification(
        {
            userId: data.userId,
            title: data.title,
            body: data.body,
        },
        {
            deadline: Date.now() + 5000,
        }
    );
}
