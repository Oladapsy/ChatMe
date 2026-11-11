import { File, Paths } from "expo-file-system";
import * as Crypto from "expo-crypto";
export function retainAttachment(uri: string): string {
  const source = new File(uri);
  if (uri.startsWith(Paths.document.uri) && source.name.startsWith("chatme-attachment-")) return uri;
  if (!source.exists || source.size <= 0) throw new Error("The attachment is missing or empty. Please select it again.");
  const destination = new File(Paths.document, `chatme-attachment-${Crypto.randomUUID()}${source.extension}`);
  source.copySync(destination);
  return destination.uri;
}
