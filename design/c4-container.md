# C4 Model – Level 2: Containers

![C4 Container Diagram](c4-container.png)

## Container Responsibilities

### Web / Frontend
- Type: HTML
- Description: Displays to the user all the tools that they can use for the health tracker as well as the health data collected

### Backend / API
- Type: Java
- Description: Collects health data to be used by user and utilizes the external email service for group notifications and invitations

### Database / Storage
- Type: PostgreSQL
- Description: Stores health data and user information

### Other Containers
(Add as necessary.)