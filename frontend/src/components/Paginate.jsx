import { Link } from 'react-router-dom';

const Paginate = ({ pages, page, keyword = '', category = '', status = '' }) => {
  if (pages <= 1) return null;
  
  // Build URL parameters for filters
  const buildUrlParams = (p) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    
    return `/auctions/page/${p}${params.toString() ? '?' + params.toString() : ''}`;
  };
  
  return (
    <div className="flex justify-center mt-8">
      <ul className="flex space-x-1">
        {/* Previous button */}
        {page > 1 && (
          <li>
            <Link
              to={buildUrlParams(page - 1)}
              className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              &laquo;
            </Link>
          </li>
        )}
        
        {/* Page numbers */}
        {[...Array(pages).keys()].map((p) => (
          <li key={p + 1}>
            <Link
              to={buildUrlParams(p + 1)}
              className={`flex items-center justify-center w-10 h-10 rounded-md ${
                p + 1 === page
                  ? 'bg-primary text-white'
                  : 'border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {p + 1}
            </Link>
          </li>
        ))}
        
        {/* Next button */}
        {page < pages && (
          <li>
            <Link
              to={buildUrlParams(page + 1)}
              className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              &raquo;
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Paginate; 