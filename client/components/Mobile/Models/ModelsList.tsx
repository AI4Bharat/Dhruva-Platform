import { Box } from '@chakra-ui/react'
import React, { FunctionComponent } from 'react'
import ModelCard from './ModelCard'

const ModelsList: FunctionComponent<{data:ModelList[]}> = (props) => {
  
  const searchedModels : ModelList[] = props.data;
  return (
    <Box>
    {Object.entries(searchedModels).map(([id, modelData]) => (
      <ModelCard
        key={id}
        name={modelData.name}
        modelId={modelData.modelId}
        version={modelData.version}
        taskType={modelData.task.type}
      />
    ))}
  </Box>
  )
}

export default ModelsList