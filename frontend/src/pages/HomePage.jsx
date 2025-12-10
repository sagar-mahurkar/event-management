import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Event from "../components/Event";

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const [searchParams] = useSearchParams();

    // Read URL query params
    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const fetchEvents = async () => {
        try {
            const params = new URLSearchParams();

            if (keyword) params.append("keyword", keyword);
            if (category) params.append("category", category);
            if (location) params.append("location", location);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            const queryStr = params.toString();

            const url =
                queryStr.length > 0
                    ? `${import.meta.env.VITE_BASE_URL}events/search?${queryStr}`
                    : `${import.meta.env.VITE_BASE_URL}events`;

            console.log("Fetching:", url);

            const response = await fetch(url);

            if (!response.ok) throw new Error("Failed to fetch events");

            const result = await response.json();
            setEvents(result.data || []);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    // Re-run search whenever filters change in URL
    useEffect(() => {
        fetchEvents();
    }, [keyword, category, location, startDate, endDate]);

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
