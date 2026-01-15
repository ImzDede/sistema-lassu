"use client";

import { Upload, File, X } from "lucide-react";
import { Typography } from "@material-tailwind/react";

type FileUploadBoxProps = {
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
};

export default function FileUploadBox({
  selectedFile,
  onFileChange,
  onRemoveFile,
}: FileUploadBoxProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-300 hover:border-brand-dark transition-colors">
      <input
        type="file"
        id="file-upload"
        onChange={onFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-gray-500" />
            <div>
              <Typography variant="small" className="text-gray-700 font-medium">
                {selectedFile.name}
              </Typography>
              <Typography variant="small" className="text-gray-400 text-xs">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
            </div>
          </div>

          <button
            onClick={onRemoveFile}
            className="p-2 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ) : (
        <label htmlFor="file-upload" className="flex items-center gap-3 cursor-pointer">
          <Upload className="w-5 h-5 text-brand-dark" />
          <Typography variant="small" className="text-brand-dark">
            Anexar arquivos
          </Typography>
        </label>
      )}
    </div>
  );
}
