import { useState } from 'react';
import {
  Tags,
  TagsTrigger,
  TagsContent,
  TagsInput,
  TagsItem,
  TagsList,
  TagsEmpty,
  TagsGroup,
  TagsValue,
} from '@/components/ui/tags';
import { Check as CheckIcon } from 'lucide-react';
import tags from '@/data/tags';

const TagsDemo = () => {
  const [selected, setSelected] = useState([]);

  const handleRemove = (value) => {
    if (!selected.includes(value)) return;
    setSelected((prev) => prev.filter((v) => v !== value));
  };

  const handleSelect = (value) => {
    if (selected.includes(value)) {
      handleRemove(value);
      return;
    }
    setSelected((prev) => [...prev, value]);
  };

  return (
    <Tags className="max-w-[320px]">
      <TagsTrigger>
        {selected.length === 0 && <span className="text-muted-foreground text-sm">Select a tag...</span>}
        {selected.map((tag) => (
          <TagsValue key={tag} onRemove={() => handleRemove(tag)}>
            {tags.find((t) => t.id === tag)?.label || tag}
          </TagsValue>
        ))}
      </TagsTrigger>
      <TagsContent>
        <TagsInput placeholder="Search tag..." />
        <TagsList>
          <TagsEmpty>No tags found.</TagsEmpty>
          <TagsGroup>
            {tags.map((tag) => (
              <TagsItem key={tag.id} value={tag.id} onSelect={() => handleSelect(tag.id)}>
                {tag.label}
                {selected.includes(tag.id) && <CheckIcon size={14} className="text-muted-foreground" />}
              </TagsItem>
            ))}
          </TagsGroup>
        </TagsList>
      </TagsContent>
    </Tags>
  );
};

export default TagsDemo;
