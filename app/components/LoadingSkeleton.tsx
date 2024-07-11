import { FaChevronRight } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type LoadingSkeletonProps = {
  count: number;
};

const LoadingSkeleton = ({ count }: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="py-4 px-5 grid grid-cols-3 text-gray-950 text-sm"
        >
          <div className="flex items-center">
            <Skeleton circle height={25} width={25} className="mr-4" />
            <Skeleton width={135} height={14} />
          </div>
          <Skeleton width={188} height={14} />
          <div className="flex items-center justify-between">
            <Skeleton width={100} height={14} />
            <div className="text-gray-300 mr-4 cursor-pointer">
              <FaChevronRight />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
