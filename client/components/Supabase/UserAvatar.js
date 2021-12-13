import { useEffect, useState } from "react";
import { Avatar, Button } from "@chakra-ui/react";
import { supabase } from "./supabaseClient";

export default function PersonalAvatar({ url, onUpload }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      // console.log("Error downloading image: ", error.message);
    }
  }

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function uploadAvatar(event) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {avatarUrl ? (
        <Avatar size="2xl" src={avatarUrl} alt="Avatar" mb={4} pos="relative" />
      ) : (
        <Avatar size="2xl" src={avatarUrl} alt="Avatar" mb={4} pos="relative" />
      )}
      <div>
        <Button
          size="sm"
          flex={1}
          mb={4}
          fontSize="sm"
          _focus={{
            bg: "gray.200",
          }}
        >
          <label className="button primary block" htmlFor="single">
            {uploading ? "Uploading ..." : "Upload"}
          </label>
        </Button>

        <input
          style={{
            visibility: "hidden",
            position: "absolute",
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
