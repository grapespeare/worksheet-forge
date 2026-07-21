import { useRef } from 'react';
import { Image } from 'lucide-react';
import type { ImagePlaceholderElement as ImagePlaceholderElementType } from '@/types/worksheet';

interface Props {
  element: ImagePlaceholderElementType;
  isSelected: boolean;
  onUpdate?: (updates: Partial<ImagePlaceholderElementType>) => void;
}

export default function ImagePlaceholderElement({ element, isSelected, onUpdate }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => { if (isSelected && fileInputRef.current) fileInputRef.current.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { onUpdate?.({ imageUrl: ev.target?.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  if (element.imageUrl) {
    return (
      <div className="w-full h-full">
        <img src={element.imageUrl} alt="Uploaded" className="w-full h-full" style={{ objectFit: 'contain', pointerEvents: 'none' }} draggable={false} />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center rounded-sm cursor-pointer" style={{ border: '2px dashed #E7E5E0', backgroundColor: '#FAF3EF' }} onClick={handleClick}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <Image className="w-8 h-8 text-ink-tertiary mb-2" strokeWidth={1.5} />
      <span className="text-[12px] text-ink-tertiary">Add Image</span>
    </div>
  );
}
