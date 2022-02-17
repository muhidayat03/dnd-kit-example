import { verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Sortable, Props as SortableProps } from "./Sortable/Sortable";

const props: Partial<SortableProps> = {
  strategy: verticalListSortingStrategy,
  itemCount: 10,
};

function App() {
  return (
    <Sortable
      {...props}
      activationConstraint={{
        delay: 250,
        tolerance: 5,
      }}
    />
  );
}

export default App;
