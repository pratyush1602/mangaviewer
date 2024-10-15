import React, { useState, useEffect } from "react";
import './Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [selectedBookId, setSelectedBookId] = useState(null);
    const [selectedChapterId, setSelectedChapterId] = useState(null);
    const [chapterPages, setChapterPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch('http://52.195.171.228:8080/books/');
                if (!response.ok) {
                    throw new Error('Failed to fetch the book data');
                }
                const data = await response.json();
                // console.log(data);
                setBooks(data);

                if (data.length > 0) {
                    setSelectedBookId(data[0].id);
                }
            } catch (error) {
                console.error("Error in fetching the book", error);
            }
        };

        fetchBooks();
    }, []);

    useEffect(() => {
        const fetchChapters = async () => {
            if (selectedBookId) {
                try {
                    const response = await fetch(`http://52.195.171.228:8080/books/${selectedBookId}/`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch the chapter data');
                    }
                    const data = await response.json();
                    // console.log("hello 2", data);
                    const chapterIds = data.chapter_ids || [];
                    // console.log(data.chapter_ids);
                    setChapters(chapterIds);

                    if (chapterIds.length > 0) {
                        setSelectedChapterId(chapterIds[0]);
                    }
                } catch (error) {
                    console.error("Error in fetching the chapter", error);
                }
            }
        };

        fetchChapters();
    }, [selectedBookId]);

    useEffect(() => {
        const fetchChapterPages = async () => {
            if (selectedChapterId) {
                try {
                    const response = await fetch(`http://52.195.171.228:8080/chapters/${selectedChapterId}/`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch the chapter pages');
                    }
                    const data = await response.json();
                    // console.log("hello ", data);
                    setChapterPages(data.pages || []);
                    // setCurrentPageIndex(0);
                } catch (error) {
                    console.error("Error in fetching the chapter pages", error);
                }
            }
        };

        fetchChapterPages();
    }, [selectedChapterId]);


    const goToNextPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else {
            const currentChapterIndex = chapters.indexOf(selectedChapterId);
            if (currentChapterIndex > 0) {
                const previousChapterId = chapters[currentChapterIndex - 1];
                
                // Fetch the previous chapter's pages
                fetchChapterPages(previousChapterId, 'previous');
            }
        }
    };
    
    const goToPreviousPage = () => {
        if (currentPageIndex < chapterPages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        } else {
            const currentChapterIndex = chapters.indexOf(selectedChapterId);
            if (currentChapterIndex < chapters.length - 1) {
                const nextChapterId = chapters[currentChapterIndex + 1];
    
                // Fetch the next chapter's pages
                fetchChapterPages(nextChapterId, 'next');
            }
        }
    };
    
    // A new function to fetch chapter pages based on navigation direction
    const fetchChapterPages = async (chapterId, direction) => {
        try {
            const response = await fetch(`http://52.195.171.228:8080/chapters/${chapterId}/`);
            if (!response.ok) {
                throw new Error('Failed to fetch the chapter pages');
            }
            const data = await response.json();
            setChapterPages(data.pages || []);
            setSelectedChapterId(chapterId);
    
            if (direction === 'next') {
                setCurrentPageIndex(0);  // Set to the first page if moving to the next chapter
            } else if (direction === 'previous') {
                setCurrentPageIndex(data.pages.length - 1);  // Set to the last page if moving to the previous chapter
            }
        } catch (error) {
            console.error("Error in fetching the chapter pages", error);
        }
    };
    


    return (
        <div className="homepage">
            <div className="navbar">
                <div className="Books">
                    {books.map((book) => (
                        <div
                            className={`manga ${selectedBookId === book.id ? "selected" : ""}`}
                            key={book.id}
                            onClick={() => {
                                // console.log(`Selected Book ID: ${book.id}`);
                                setSelectedBookId(book.id);
                                setSelectedChapterId(null);
                                setChapterPages([]);
                                setCurrentPageIndex(0);
                            }}
                        >
                            {book.title}
                        </div>
                    ))}
                </div>
                <div className="Chapters">
                    {chapters.map((chapterId, index) => (
                        <div
                            className={`chapterBox ${selectedChapterId === chapterId ? "selected" : ""}`}
                            key={`${chapterId}-${selectedChapterId}`}
                            onClick={() => {
                                // console.log(`Selected Chapter ID: ${chapterId}`);
                                setSelectedChapterId(chapterId);
                                setCurrentPageIndex(0);
                            }}
                        >
                            {index + 1}
                        </div>
                    ))}
                </div>

            </div>
            <div className="desc">
                {chapterPages.length > 0 && (
                    <div style={{ position: 'relative' }}>
                        <img
                            src={chapterPages[currentPageIndex].image.file}
                            alt={`Page ${currentPageIndex + 1}`}
                            width={400}  // Increased width
                            height={600} // Increased height
                        />
                        <div
                            className="image-overlay"
                            onClick={goToPreviousPage}
                            style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%' }}
                        />
                        <div
                            className="image-overlay"
                            onClick={goToNextPage}
                            style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%' }}
                        />
                        <div className="page-navigation">
                            <span>{`${currentPageIndex + 1}/${chapterPages.length}`}</span>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Home;
