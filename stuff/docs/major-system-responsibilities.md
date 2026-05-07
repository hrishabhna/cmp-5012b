## Major System Responsibilities

The Health Tracker application is designed with a clear separation of concerns to ensure high cohesion and maintainability. The major responsibilities are:

* **User Authentication & Security**
    * Handles secure sign-up, login, and session management.
    * Ensures users can only access and edit their own private health data.

* **Profile & Health Metric Management**
    * Captures core user data such as age, height, and weight.
    * Responsible for calculating derived metrics, specifically BMI.

* **Activity & Exercise Tracking**
    * Processes daily activity inputs (e.g., steps or gym sessions).
    * Calculates "Health Points" or calories burned based on user input.

* **Nutritional Logging & Analysis**
    * Manages the logic for logging daily food and water intake.
    * Compares daily totals against predefined user health goals.

* **Social & Competitive Logic**
    * Manages group creation and "Join Code" validation.
    * Aggregates data to generate real-time group leaderboards.

* **Data Persistence Layer**
    * Interface between the application logic and the JSON/CSV storage files.
    * Ensures all user data is saved and retrieved correctly across sessions.
