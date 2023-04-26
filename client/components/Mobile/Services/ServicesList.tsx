import React, { FunctionComponent } from 'react'
import ServiceCard from './ServiceCard'

const ServicesList: FunctionComponent<{data:ServiceList[]}> = (props) => {

  const searchedservices : ServiceList[] = props.data
  return (
    <>
    {Object.entries(searchedservices).map(([id, serviceData]) => (
      <ServiceCard
        key={id}
        name={serviceData.name}
        serviceID={serviceData.serviceId}
        modelID={serviceData.modelId}
        date={new Date(serviceData.publishedOn).toDateString()}
      />
    ))}
  </>
  )
}

export default ServicesList