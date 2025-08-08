import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null); // Changed from imagePreview to filePreview
  const [fileName, setFileName] = useState(""); // Store file name for non-image files
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Define allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Unsupported file type. Please select an image, PDF, or Word document."
      );
      return;
    }

    setFileName(file.name); // Store file name
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result); // Base64 data for upload
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        file: filePreview, // Changed from image to file
      });

      // Clear form
      setText("");
      setFilePreview(null);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full">
      {filePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {fileName.endsWith(".jpg") ||
            fileName.endsWith(".jpeg") ||
            fileName.endsWith(".png") ||
            fileName.endsWith(".gif") ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-base-200 rounded-lg border border-zinc-700">
                <span className="text-sm truncate">{fileName}</span>
              </div>
            )}
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 relative">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="button"
            className="btn-sm text-zinc-400 hidden sm:flex btn btn-circle"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile size={20} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <input
            type="file"
            accept="image/*,application/pdf,.doc,.docx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              filePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !filePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
