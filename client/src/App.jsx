const removeBackground = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("https://your-render-backend-url/remove-bg", {
    method: "POST",
    body: formData
  });

  if (res.ok) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    // set to state or display in img tag
    console.log("Image processed:", url);
  } else {
    console.error("Background removal failed");
  }
};
