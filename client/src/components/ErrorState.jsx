export default function ErrorState({ message = "Unable to load data. Try again." }) {
  return <div className="text-center py-12 text-red-500 text-sm">{message}</div>;
}
