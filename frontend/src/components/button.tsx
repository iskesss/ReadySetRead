import React, { forwardRef } from 'react'

import "../styles/Button.css"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ loading = false, children, ...props }, ref) => {
    const classes = "btn";
    return (
        <button
            ref={ref}
            className={classes}
            {...props}
        >
            {loading && <span className="loading-spinner">⏳</span>}
            {children}
        </button>
    );
})