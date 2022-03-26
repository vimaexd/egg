const getFluteGangId = () => {
  const isDev = (process.env.NODE_ENV != "production")

  if(isDev) return "606089486660534296"
  else return "660909173281652807"
}

export {
  getFluteGangId
}