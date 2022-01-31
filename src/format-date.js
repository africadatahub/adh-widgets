export let formatDate = (date) => {
    const dob = new Date(date);
  
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
       'August', 'September', 'October', 'November', 'December'
    ];
  
    const day = dob.getDate();
    const monthIndex = dob.getMonth();
    const year = dob.getFullYear();

    return `${day} ${monthNames[monthIndex]} ${year}`;
}