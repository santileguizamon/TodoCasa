export default function TableCell({
    children,
    header = false,
  }: {
    children: React.ReactNode;
    header?: boolean;
  }) {
    const Component = header ? "th" : "td";
  
    return (
      <Component
        style={{
          textAlign: "left",
          padding: "8px",
          borderBottom: "1px solid #ddd",
          fontWeight: header ? "bold" : "normal",
        }}
      >
        {children}
      </Component>
    );
  }
  