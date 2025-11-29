// App.jsx (updated with sorting by rating)
import { useState } from "react";
import Header from "./components/Header";
import Entry from "./components/Entry";
import baseData from "./data";

export default function App() {
    const [birds, setBirds] = useState(baseData);
    const [search, setSearch] = useState("");
    const [sortMode, setSortMode] = useState("none");
    const [fullscreenImg, setFullscreenImg] = useState(null);

    function openFullscreen(imgSrc, alt) {
        setFullscreenImg({ src: imgSrc, alt });
    }

    function closeFullscreen() {
        setFullscreenImg(null);
    }


    function deleteBird(id) {
        setBirds((prev) => prev.filter((b) => b.id !== id));
    }

    function changeRating(id, newRating) {
        setBirds((prev) => prev.map((b) => (b.id === id ? { ...b, rating: newRating } : b)));
    }

    function editBird(id, newName, newDesc) {
        setBirds((prev) => prev.map((b) => (b.id === id ? { ...b, name: newName, description: newDesc } : b)));
    }

    function addBird() {
        const name = prompt("Bird name:");
        const description = prompt("Description:");
        const imgUrl = prompt("Image URL:");
        if (!name || !imgUrl) return;

        const newBird = {
            id: Date.now(),
            name,
            description,
            rating: 3,
            img: { src: imgUrl, alt: name }
        };

        setBirds((prev) => [...prev, newBird]);
    }

    function getFilteredAndSortedBirds() {
        let result = birds.filter((b) => b.name.toLowerCase().startsWith(search.toLowerCase()));

        if (sortMode === "asc") result.sort((a, b) => a.name.localeCompare(b.name));
        if (sortMode === "desc") result.sort((a, b) => b.name.localeCompare(a.name));
        if (sortMode === "rating-asc") result.sort((a, b) => a.rating - b.rating);
        if (sortMode === "rating-desc") result.sort((a, b) => b.rating - a.rating);

        return result;
    }

    const birdElements = getFilteredAndSortedBirds().map((bird) => (
        <Entry
            key={bird.id}
            {...bird}
            onDelete={deleteBird}
            onRatingChange={changeRating}
            onEdit={editBird}
            onImageClick={() => openFullscreen(bird.img.src, bird.img.alt)}
        />
    ));

   return (
        <div className="app-container">
            <Header />

            <div className="controls">
                <input
                    type="text"
                    placeholder="Search birds..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                    <option value="none">No sorting</option>
                    <option value="asc">Sort A → Z</option>
                    <option value="desc">Sort Z → A</option>
                    <option value="rating-asc">Sort by rating ↑</option>
                    <option value="rating-desc">Sort by rating ↓</option>
                </select>

                <button onClick={addBird}>Add bird</button>
            </div>


            <main className="container">
                {birdElements}
            </main>

            {fullscreenImg && (
                <div className="fullscreen-overlay" onClick={closeFullscreen}>
                    <img src={fullscreenImg.src} alt={fullscreenImg.alt} className="fullscreen-image" />
                </div>
            )}

            <footer className="footer">
                <p>© 2025 Bird Journal <br/>
                    Images made by: Antoni Mrowiński <br/>
                    Page developed by: Antonina Gardzielewska
                </p>
            </footer>
        </div>
    );
}
