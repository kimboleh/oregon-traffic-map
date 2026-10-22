# ODOT Traffic Incident Map

This web app pulls live traffic incident data from the Oregon Department of Transportation (ODOT) and displays it on an interactive map via the ArcGIS JavaScript Maps SDK. You can [see the live site here](https://kimberlynachbur.dev/oregon-traffic-map).

GitHub Pages doesn't support back-end architecture, so in order to host it, I've had to create a static version of it, which you can find in the `static` branch of this repo. This static version uses plain HTML, CSS, and JavaScript, and it reads its data from ODOT's public ArcGIS feature service.

The original version in the `master` branch runs an ASP.NET Core MVC app written in C#. A backend service fetches incidents from ODOT's TripCheck API using an API key kept out of the browser, caches the response for 60 seconds, and serves it to the map through its own API endpoint. If you'd like to see more of how I developed this using ASP.NET, you can peruse the `master` branch.