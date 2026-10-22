import React from "react";
import { Modal, Button } from "@/components/ui";
import { NewsItem } from "./types";

interface NewsDetailModalProps {
    news: NewsItem | null;
    onClose: () => void;
}

export default function NewsDetailModal({
    news,
    onClose,
}: NewsDetailModalProps) {
    if (!news) return null;

    return (
        <Modal
            isOpen={!!news}
            onClose={onClose}
            title={news.title}
            description={`Diterbitkan pada ${news.date} oleh ${news.author}`}
            size="lg"
            footer={
                <Button variant="secondary" onClick={onClose}>
                    Tutup Berita
                </Button>
            }
        >
            <div className="space-y-4">
                <div className="p-2.5 sm:p-3 bg-purple-50 rounded-xl text-xs font-semibold text-purple-800 inline-block">
                    Kategori: {news.category} • {news.readTime}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {news.content}
                </p>
            </div>
        </Modal>
    );
}

