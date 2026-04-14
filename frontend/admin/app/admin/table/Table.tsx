export default function Table({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "16px",
        }}
      >
        {children}
      </table>
    );
  }
  