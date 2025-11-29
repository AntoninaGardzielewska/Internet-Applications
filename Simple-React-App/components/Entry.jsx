import { useState } from "react";

export default function Entry({
    id,
    img,
    name,
    date,
    place,
    description,
    rating,
    onDelete,
    onRatingChange,
    onEdit,
    onImageClick
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const [editedDescription, setEditedDescription] = useState(description);

    function saveEdit() {
        onEdit(id, editedName, editedDescription);
        setIsEditing(false);
    }

    return (
        <article className="journal-entry">
            <div className="main-image-container">
                <img 
                    className="main-image" 
                    src={img.src} 
                    alt={img.alt} 
                    onClick={onImageClick}
                    style={{cursor: "pointer"}}
                />
            </div>

            <div className="info-container">
                <div className="info-meta">
                    <div className="place">
                        <img className="marker" src="../images/marker.png" alt="map marker icon" height="20" />
                        <span>{place}</span>
                    </div>
                    <p className="date">{date}</p>
                </div>

                {isEditing ? (
                    <div className="edit-block">
                        <input
                            className="edit-input"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                        />
                        <textarea
                            className="edit-textarea"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                        />
                    </div>
                ) : (
                    <>
                        <h2 className="entry-title">{name}</h2>
                        <p className="entry-text">{description}</p>
                    </>
                )}

                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={star <= rating ? "star filled" : "star"}
                            onClick={() => onRatingChange(id, star)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <div className="btn-row">
                    {isEditing ? (
                        <button className="save-btn" onClick={saveEdit}>Save</button>
                    ) : (
                        <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                    )}

                    <button className="delete-btn" onClick={() => onDelete(id)}>Delete</button>
                </div>
            </div>
        </article>
    );
}