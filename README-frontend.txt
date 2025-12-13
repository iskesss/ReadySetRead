=================================================
ReadySetRead Frontend
=================================================

Authors:
    Will DeGasparis
    Juliana Bruno
    Marta Balikcioglu
    Jordan Bouret
    Cole Paris

=================================================

Tech Stack:
    React 19.1.1 with TypeScript
    Vite 7.1.7 - Dev server
    Axios 1.13.2 - HTTP client for interfacing with backend API

=================================================

Directory Structure:

    Everything not in frontend/src came installed with React, Vite, axios or node.

    frontend/src/

        main.tsx                    # Creates the actual root app and configures routing to pages

        pages/                      # Each corresponds to one page on the website
            login.tsx              
            signup.tsx             
            StudentLanding.tsx     
            ParentLanding.tsx      
            library.tsx            
            Quiz.tsx               
            QuizResults.tsx        
            ParentProgress.tsx     
            Rewards.tsx

        components/                 # components reused multiple times inside pages
            layout.tsx                  # wrapper for every page that handles page layout and dynamic background colors
            MainNavMenu.tsx             # navigation bar at the top of most pages
            button.tsx                  # multifunctional button component, used all over the app
            LibraryBook.tsx             # book card for library grid
            StudentLandingBook.tsx      # book card for student home page
            progresschart.tsx           # pie chart for progress visuals on student home page
            
        api/                        # functions called from the pages that connect frontend and backend
            types.ts                    # contains request and response types that mirror types on the backend
            client.ts                   # defines the actual api object and an interceptor that attaches authentication to all outgoing requests
            students.ts                 # student-centered api call functions 
            parents.ts                  # parent-centered api call functions
            quiz.ts                     # quiz handling api call functions
            rewards.ts                  # reward page, coin, and background api call functions
            books.ts                    # book-related api call functions

        styles/
            App.css                 # App-wide styles used by many or all pages
            [ Every other css file corresponds to a page or component tsx file ]

=================================================

How to run: (Assuming the backend is live on AWS)

    BASH:
    cd frontend
    npm install
    npm run dev