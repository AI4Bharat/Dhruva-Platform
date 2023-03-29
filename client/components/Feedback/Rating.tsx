import { HStack } from '@chakra-ui/react';
import { useState } from 'react';
import { StarIcon } from '@chakra-ui/icons';

const Rating = ({ onChange }) => {
  const [rating, setRating] = useState(0);

  const handleClick = (newRating) => {
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  return (
    <HStack>
      {[...Array(5)].map((_, index) => {
        const starNumber = index + 1;
        return (
          <StarIcon
            key={index}
            fontSize={"2rem"}
            color={starNumber <= rating ? 'orange.500' : 'gray.200'}
            cursor="pointer"
            onClick={() => handleClick(starNumber)}
          />
        );
      })}
    </HStack>
  );
};

export default Rating;
