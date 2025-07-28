type Props = {
  children: React.ReactNode;
};

export default function PageTitle({ children }: Props) {
  return (
    <h2 className="mb-4 text-2xl font-bold">
      <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        {children}
      </span>
    </h2>
  );
}
