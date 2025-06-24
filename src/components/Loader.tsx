import "./Loader.css";

export const Loader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 bg-green-300 rounded-full dot-loader"></div>
      <div className="w-4 h-4 bg-green-300 rounded-full dot-loader"></div>
      <div className="w-4 h-4 bg-green-300 rounded-full dot-loader"></div>
      <div className="w-4 h-4 bg-green-300 rounded-full dot-loader"></div>
    </div>
  );
};
