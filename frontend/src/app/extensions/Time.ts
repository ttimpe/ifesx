String.prototype.toDate = function(this: string) {
  // Is time
  if (this.match('00:00')) {
   const parts = this.split(':')
   const hours = parseInt(parts[0])
   const minutes = parseInt(parts[1])
   let date = new Date(0)
   date.setUTCHours(hours)
   date.setUTCMinutes(minutes)
   return date
  }
  return undefined
}
