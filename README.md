# CrimeGrid.ai: A Scalable, Multi-City Crime Analysis and Prediction Platform

This project's goal is to build a comprehensive, cloud-native platform for analyzing and predicting crime, hosted at `crimegrid.ai`. While the initial focus is on Chicago, the architecture is designed to be scalable and flexible, allowing for the easy integration of crime data from other major cities.

The development and deployment process will be orchestrated using a custom **MCP (Model Context Protocol) server**, which acts as a bridge to automate workflows and interact with both local development tools and Google Cloud Platform (GCP) services.

## Objectives

1.  **Multi-City Support**: Architect the platform to be data-driven, allowing users to select a city (e.g., Chicago, Dallas, Baltimore) and visualize its specific crime data.
2.  **Modern Frontend**: Build a responsive and user-friendly web application using **React**. The site will feature a home/landing page and a dedicated, feature-rich map visualization page.
3.  **Granular Data Visualization**: Use the Google Maps Platform to display crime incidents. Implement a sophisticated filtering system to allow users to query data by type, date, location, and other relevant factors (e.g., gang territories).
4.  **Scalable Cloud Architecture**: Host the entire application on Google Cloud Platform (GCP), leveraging its managed services for a robust and scalable backend, data pipeline, and hosting solution.
5.  **Predictive Analytics**: Develop and integrate machine learning models using Vertex AI to analyze crime patterns, identify correlations (e.g., between petty and violent crimes), and ultimately predict future crime hotspots.
6.  **MCP-Driven Workflow**: Utilize the custom MCP server to automate development, testing, and deployment tasks, demonstrating an advanced DevOps and MLOps methodology.

## Technology Stack (Proposed)

-   **Frontend**: **React** (using a modern build tool like Vite), HTML, CSS
-   **Mapping**: Google Maps Platform (migrating from Mapbox GL JS)
-   **Web Hosting**: **Firebase Hosting** for the React frontend.
-   **Backend API**: **Cloud Functions** (HTTP-triggered) to serve data from the data warehouse to the frontend.
-   **Data Ingestion & ETL**: **Cloud Functions** (triggered by Cloud Scheduler) to periodically fetch data from city data portals and store it in Cloud Storage. A subsequent function or Dataflow job will load this data into BigQuery.
-   **Data Warehouse**: Google BigQuery
-   **Machine Learning**: Google Cloud AI Platform (Vertex AI) for notebooks, training, and prediction endpoints.
-   **Authentication**: **Firebase Authentication** to track site usage and provide a personalized experience.
-   **Automation & Orchestration**: Custom **MCP (Model Context Protocol)** server to interact with development tools and GCP APIs.

## Project Status

The project is in the architectural planning phase. The initial proof-of-concept is being deprecated in favor of a new, scalable architecture built from the ground up on GCP with React. The next step is to establish the foundational GCP services and set up the React development environment.
