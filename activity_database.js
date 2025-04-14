// Activity Database for Weather-Based Recommendations
window.activityDatabase = [
    // Outdoor Activities - Clear Weather
    {
        name: "Hiking",
        description: "Explore nature trails and enjoy scenic views while getting exercise.",
        category: "outdoor",
        intensity: 3,
        duration: 180,
        weatherConditions: ["clear", "few clouds", "scattered clouds"],
        temperatureRange: { min: 10, max: 30 },
        windSpeedMax: 20,
        tags: ["nature", "exercise", "scenic"]
    },
    {
        name: "Beach Day",
        description: "Relax on the sand, swim in the water, and enjoy the sun.",
        category: "outdoor",
        intensity: 2,
        duration: 240,
        weatherConditions: ["clear", "few clouds"],
        temperatureRange: { min: 25, max: 40 },
        windSpeedMax: 15,
        tags: ["relaxation", "swimming", "sun"]
    },
    {
        name: "Cycling",
        description: "Ride a bike through scenic routes or urban paths.",
        category: "outdoor",
        intensity: 4,
        duration: 120,
        weatherConditions: ["clear", "few clouds", "scattered clouds", "broken clouds"],
        temperatureRange: { min: 10, max: 30 },
        windSpeedMax: 15,
        tags: ["exercise", "scenic", "transportation"]
    },
    {
        name: "Picnic",
        description: "Enjoy a meal outdoors in a park or scenic location.",
        category: "outdoor",
        intensity: 1,
        duration: 120,
        weatherConditions: ["clear", "few clouds", "scattered clouds"],
        temperatureRange: { min: 15, max: 30 },
        windSpeedMax: 10,
        tags: ["food", "relaxation", "social"]
    },
    {
        name: "Photography",
        description: "Capture beautiful landscapes and moments with your camera.",
        category: "outdoor",
        intensity: 2,
        duration: 180,
        weatherConditions: ["clear", "few clouds", "scattered clouds", "broken clouds", "mist", "fog"],
        temperatureRange: { min: 5, max: 35 },
        tags: ["creative", "scenic", "hobby"]
    },

    // Outdoor Activities - Cloudy Weather
    {
        name: "Jogging",
        description: "Run at a steady pace to improve cardiovascular health.",
        category: "outdoor",
        intensity: 4,
        duration: 60,
        weatherConditions: ["few clouds", "scattered clouds", "broken clouds", "overcast"],
        temperatureRange: { min: 5, max: 25 },
        tags: ["exercise", "health", "routine"]
    },
    {
        name: "Gardening",
        description: "Plant, weed, and tend to a garden.",
        category: "outdoor",
        intensity: 3,
        duration: 120,
        weatherConditions: ["few clouds", "scattered clouds", "broken clouds", "overcast"],
        temperatureRange: { min: 10, max: 30 },
        tags: ["hobby", "nature", "productive"]
    },
    {
        name: "Outdoor Yoga",
        description: "Practice yoga poses and meditation in a natural setting.",
        category: "outdoor",
        intensity: 2,
        duration: 60,
        weatherConditions: ["clear", "few clouds", "scattered clouds"],
        temperatureRange: { min: 15, max: 30 },
        windSpeedMax: 10,
        tags: ["exercise", "relaxation", "mindfulness"]
    },

    // Outdoor Activities - Light Rain
    {
        name: "Nature Walk",
        description: "Take a leisurely walk through natural surroundings.",
        category: "outdoor",
        intensity: 2,
        duration: 90,
        weatherConditions: ["drizzle", "light rain"],
        temperatureRange: { min: 10, max: 25 },
        tags: ["nature", "relaxation", "light exercise"]
    },
    {
        name: "Bird Watching",
        description: "Observe and identify different bird species in their natural habitat.",
        category: "outdoor",
        intensity: 1,
        duration: 120,
        weatherConditions: ["clear", "few clouds", "scattered clouds", "broken clouds", "drizzle"],
        temperatureRange: { min: 5, max: 30 },
        tags: ["nature", "observation", "hobby"]
    },

    // Outdoor Activities - Wind
    {
        name: "Kite Flying",
        description: "Fly a kite and enjoy the wind.",
        category: "outdoor",
        intensity: 2,
        duration: 90,
        weatherConditions: ["clear", "few clouds", "scattered clouds", "broken clouds"],
        temperatureRange: { min: 10, max: 30 },
        windSpeedMin: 10,
        tags: ["fun", "hobby", "family"]
    },
    {
        name: "Sailing",
        description: "Navigate a sailboat using wind power.",
        category: "outdoor",
        intensity: 3,
        duration: 180,
        weatherConditions: ["clear", "few clouds", "scattered clouds", "broken clouds"],
        temperatureRange: { min: 15, max: 35 },
        windSpeedMin: 8,
        windSpeedMax: 25,
        tags: ["water", "skill", "adventure"]
    },

    // Indoor Activities - Rainy Weather
    {
        name: "Reading",
        description: "Enjoy a good book in a comfortable setting.",
        category: "indoor",
        intensity: 1,
        duration: 120,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain"],
        temperatureRange: { min: -10, max: 40 },
        tags: ["relaxation", "educational", "hobby"]
    },
    {
        name: "Cooking",
        description: "Prepare a meal or bake something delicious.",
        category: "indoor",
        intensity: 2,
        duration: 90,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain", "snow"],
        temperatureRange: { min: -10, max: 40 },
        tags: ["food", "creative", "skill"]
    },
    {
        name: "Board Games",
        description: "Play board games with family or friends.",
        category: "indoor",
        intensity: 1,
        duration: 120,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain", "snow"],
        temperatureRange: { min: -10, max: 40 },
        tags: ["social", "fun", "competitive"]
    },
    {
        name: "Movie Marathon",
        description: "Watch a series of movies back-to-back.",
        category: "indoor",
        intensity: 1,
        duration: 240,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain", "snow"],
        temperatureRange: { min: -10, max: 40 },
        tags: ["entertainment", "relaxation", "social"]
    },

    // Indoor Activities - Extreme Weather
    {
        name: "Home Workout",
        description: "Exercise at home using bodyweight or equipment.",
        category: "indoor",
        intensity: 4,
        duration: 60,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain", "snow", "extreme"],
        temperatureRange: { min: -20, max: 45 },
        tags: ["exercise", "health", "routine"]
    },
    {
        name: "Arts and Crafts",
        description: "Create art or craft projects.",
        category: "indoor",
        intensity: 2,
        duration: 120,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain", "snow", "extreme"],
        temperatureRange: { min: -20, max: 45 },
        tags: ["creative", "hobby", "productive"]
    },
    {
        name: "Baking",
        description: "Bake bread, cookies, cakes, or other treats.",
        category: "indoor",
        intensity: 2,
        duration: 120,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain", "snow", "extreme"],
        temperatureRange: { min: -20, max: 45 },
        tags: ["food", "creative", "hobby"]
    },
    {
        name: "Online Learning",
        description: "Take an online course or learn a new skill.",
        category: "indoor",
        intensity: 1,
        duration: 90,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain", "snow", "extreme"],
        temperatureRange: { min: -20, max: 45 },
        tags: ["educational", "productive", "skill"]
    },

    // Indoor Activities - Hot Weather
    {
        name: "Indoor Swimming",
        description: "Swim in an indoor pool.",
        category: "indoor",
        intensity: 4,
        duration: 60,
        weatherConditions: ["clear", "few clouds", "extreme"],
        temperatureRange: { min: 30, max: 45 },
        tags: ["exercise", "water", "cooling"]
    },
    {
        name: "Museum Visit",
        description: "Explore exhibits at a local museum.",
        category: "indoor",
        intensity: 2,
        duration: 180,
        weatherConditions: ["clear", "few clouds", "extreme", "rain", "thunderstorm"],
        temperatureRange: { min: -10, max: 45 },
        tags: ["educational", "cultural", "indoor"]
    },
    {
        name: "Shopping",
        description: "Browse and shop at a mall or stores.",
        category: "indoor",
        intensity: 2,
        duration: 180,
        weatherConditions: ["clear", "few clouds", "extreme", "rain", "thunderstorm", "snow"],
        temperatureRange: { min: -10, max: 45 },
        tags: ["social", "shopping", "indoor"]
    },

    // Indoor Activities - Cold Weather
    {
        name: "Hot Cocoa and Book",
        description: "Enjoy a warm drink while reading a good book.",
        category: "indoor",
        intensity: 1,
        duration: 120,
        weatherConditions: ["snow", "extreme"],
        temperatureRange: { min: -20, max: 5 },
        tags: ["relaxation", "cozy", "winter"]
    },
    {
        name: "Puzzle Solving",
        description: "Work on a jigsaw puzzle or brain teaser.",
        category: "indoor",
        intensity: 1,
        duration: 120,
        weatherConditions: ["rain", "thunderstorm", "drizzle", "shower rain", "snow", "extreme"],
        temperatureRange: { min: -20, max: 45 },
        tags: ["mental", "hobby", "focus"]
    }
];
