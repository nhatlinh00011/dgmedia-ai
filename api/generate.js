import { fal } from "@fal-ai/client";

export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {

    const {
      image,
      prompt,
      duration,
      resolution,
      generate_audio
    } = req.body || {};


    if (!image) {

      return res.status(400).json({
        error: "Thiếu hình ảnh."
      });

    }


    if (!prompt) {

      return res.status(400).json({
        error: "Thiếu prompt."
      });

    }


    if (!process.env.FAL_KEY) {

      return res.status(500).json({
        error:
          "Chưa cấu hình FAL_KEY trên server."
      });

    }


    fal.config({
      credentials: process.env.FAL_KEY
    });


    const allowedDurations = [
      "5",
      "10",
      "15",
      "20",
      "30"
    ];


    const selectedDuration =
      allowedDurations.includes(
        String(duration)
      )
        ? String(duration)
        : "10";


    const selectedResolution =
      resolution === "480p"
        ? "480p"
        : "720p";


    const result =
      await fal.subscribe(
        "bytedance/seedance-2.5/image-to-video",
        {

          input: {

            prompt: String(prompt),

            image_url: image,

            resolution:
              selectedResolution,

            duration:
              selectedDuration,

            aspect_ratio:
              "auto",

            generate_audio:
              Boolean(generate_audio)

          },

          logs: false

        }
      );


    const videoUrl =
      result?.data?.video?.url;


    if (!videoUrl) {

      console.error(
        "Unexpected fal result:",
        result
      );

      return res.status(500).json({

        error:
          "AI không trả về video."

      });

    }


    return res.status(200).json({

      success: true,

      videoUrl,

      requestId:
        result.requestId || null

    });


  } catch (error) {

    console.error(
      "DG MEDIA AI ERROR:",
      error
    );


    return res.status(500).json({

      error:
        error?.message ||
        "Lỗi tạo video AI."

    });

  }

}
