type Props = {
  children: React.ReactNode;
};

export default function PageTitle({ children }: Props) {
  return <h2 className="text-primary mb-4 text-2xl font-bold">{children}</h2>;
}
