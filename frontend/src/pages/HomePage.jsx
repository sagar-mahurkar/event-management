import { useEffect, useState } from "react";
import Event from "../components/Event";

const HomePage = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}events`);

                if (!response.ok) throw new Error("Failed to fetch events");

                const result = await response.json();
                console.log("API RESULT:", result);

                setEvents(result.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, []);

    console.log("EVENTS TO RENDER:", events);

    return (
        <div className="container mt-5">
            <div className="row row-cols-1 row-cols-md-2 g-4">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div className="col" key={event.id}>
                            <Event event={event} />
                        </div>
                    ))
                ) : (
                    <p>No events found.</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;
