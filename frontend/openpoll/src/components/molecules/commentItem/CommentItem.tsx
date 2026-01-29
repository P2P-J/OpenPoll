import { motion } from 'motion/react';
import { ThumbsUp, ThumbsDown, Heart } from 'lucide-react';

export interface CommentItemProps {
  id: number;
  author: string;
  option: 'agree' | 'disagree';
  content: string;
  likes: number;
  createdAt: string;
  onLike?: (id: number) => void;
}

export function CommentItem({
  id,
  author,
  option,
  content,
  likes,
  createdAt,
  onLike,
}: CommentItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-50 rounded-xl"
    >
      <div className="flex items-start space-x-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            option === 'agree' ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {option === 'agree' ? (
            <ThumbsUp className="w-5 h-5 text-green-600" />
          ) : (
            <ThumbsDown className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold">{author}</span>
            <span className="text-sm text-gray-500">{createdAt}</span>
          </div>
          <p className="text-gray-700 leading-relaxed mb-3">{content}</p>
          <button
            onClick={() => onLike?.(id)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="font-medium">{likes}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
