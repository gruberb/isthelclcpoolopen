import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Also keyed on the query so switching between the status and schedule views (?view=)
// starts at the top like a page change.
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
