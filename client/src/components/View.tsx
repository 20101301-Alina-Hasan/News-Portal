import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquareText } from "lucide-react";
import { Upvote } from "./Upvote";
import { Bookmark } from "./Bookmark";
import { Comment } from "./Comment";
import { LoaderIcon } from "./Icons/LoaderIcon";
import { fetchNewsByID } from '../services/newsService';
import { NewsProps } from "../interfaces/newsInterface";
import { useUserContext } from "../contexts/userContext";

export function View() {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [news, setNews] = useState<NewsProps["news"]>();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { news_id } = state?.news || {};
    const { userState } = useUserContext();
    const token = userState.token;

    const loadNews = async () => {
        try {
            if (!news_id) {
                throw new Error("News ID is missing");
            }

            const fetchedNews = await fetchNewsByID(news_id, token);
            setNews(fetchedNews);

        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            loadNews();
        }, 500);

        return () => clearTimeout(timeout);
    }, [token]);

    if (loading) {
        return <LoaderIcon />
    }

    if (error) {
        return <div className="min-h-screen bg-base-200 text-red-500 font-semibold">Error: {error}</div>;
    }

    if (!news) {
        return <div>No news found.</div>;
    }

    return (
        <>
            <div className="modal modal-open">
                <div className="modal-box max-w-4xl">
                    <div className="flex justify-end pb-2">
                        <button
                            onClick={() => navigate(-1)}
                            aria-label="Close"
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            X
                        </button>
                    </div>

                    <div className="pt-2 pb-4 px-6">
                        <div className="w-full h-[1rem] bg-red-800"></div>

                        <div className="items-center my-4">
                            <h2 className="text-5xl font-extrabold font-serif">THE NEWSLETTER</h2>
                            <div className="w-full h-[0.2rem] bg-red-800 mt-2"></div>
                            <h2 className="text-3xl font-semibold my-4 font-serif">{news.title}</h2>
                        </div>

                        <div className="text-sm my-4">
                            <span className="p-1 px-3 bg-amber-300 text-gray-900">{news.releaseDate}</span>
                            <span className="p-1 pl-3 bg-amber-400 text-gray-950 font-semibold pr-24 rounded-r-lg">
                                @{news.username}
                            </span>
                        </div>

                        <div className="flex my-4 gap-2 flex-wrap">
                            {news.tags.map((tag, index) => ( //line 90
                                <div key={index} className='badge badge-outline font-medium'>
                                    #{tag.tag}
                                </div>
                            ))}
                        </div>

                        <div className="bg-base-200 rounded-lg p-4 overflow-hidden">
                            {news.thumbnail && (
                                <img
                                    src={news.thumbnail}
                                    alt={news.title}
                                    className="w-72 rounded-lg object-cover float-left mr-6 mb-4"
                                />
                            )}
                            <div className="flex-1 min-w-[50%]">
                                <p className="text-base text-justify leading-relaxed font-serif">{news.description}</p>
                            </div>
                        </div>
                        <div className="clear-left mt-4">
                            <div className="w-full h-[0.1rem] bg-red-800" />
                            <div className="flex justify-between my-4">
                                <div className="flex justify-start gap-4">
                                    <Upvote news_id={news.news_id} upvotes={news.upvotes} hasUpvoted={news.hasUpvoted} />
                                    <div className="flex items-center gap-2">
                                        <MessageSquareText />
                                        <span className="text-sm font-medium">{news.commentCount}</span>
                                    </div>
                                </div>
                                <div className="justify-end">
                                    <Bookmark news_id={news.news_id} hasBookmarked={news.hasBookmarked} />
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-[0.1rem] bg-red-800"></div>
                        <div>
                            <Comment news_id={news.news_id} />
                        </div>
                    </div>
                </div >
            </div >
        </>
    );
}




