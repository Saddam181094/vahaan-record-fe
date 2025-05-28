import CircularProgress from "@/components/CircularProgress";

const Loader = ({color}:{color?:string}) => {
  return (
    <div className="absolute h-[80%] w-[75%] z-50 bg-neutral-700 opacity-25 flex justify-center items-center">
      <CircularProgress color={`${color}`}/>
    </div>
  );
};

export default Loader;
