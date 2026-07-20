import crypto from "node:crypto";

export const runtime = "nodejs";

function buildSignature(params: Record<string, string>, apiSecret: string) {
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${signatureBase}${apiSecret}`).digest("hex");
}

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER || "tarek-helal/products";

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json({ message: "Cloudinary is not configured." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ message: "Missing image file." }, { status: 400 });
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = buildSignature({ folder, timestamp }, apiSecret);

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file, file.name);
  cloudinaryForm.append("api_key", apiKey);
  cloudinaryForm.append("timestamp", timestamp);
  cloudinaryForm.append("folder", folder);
  cloudinaryForm.append("signature", signature);

  const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: cloudinaryForm,
  });

  if (!cloudinaryResponse.ok) {
    const errorText = await cloudinaryResponse.text();
    return Response.json(
      { message: "Cloudinary upload failed.", details: errorText },
      { status: 502 }
    );
  }

  const payload = await cloudinaryResponse.json();

  return Response.json({
    url: payload.secure_url || payload.url,
    public_id: payload.public_id,
    width: payload.width,
    height: payload.height,
  });
}