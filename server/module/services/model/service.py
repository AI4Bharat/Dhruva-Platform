from db.MongoBaseModel import MongoBaseModel

class Service(MongoBaseModel):
    serviceId: str
    name: str
    serviceDescription: str
    hardwareDescription: str
    publishedOn: int
    modelId: str
    endpoint: str
    key:str
