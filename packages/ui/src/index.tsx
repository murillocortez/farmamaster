import * as React from "react";

export const Button = ({ children, ...props }: any) => {
    return <button style={{ padding: '10px 20px', borderRadius: '5px' }} {...props}>{children}</button>;
};
