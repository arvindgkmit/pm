const getAllWorkspace = async (req, res, next) => {
  const data = res.data || null;
  const serializedData = [];
  data.forEach((item) => {
    const user = {
      workspaceId: item.dataValues.workspace_id,
      email: item.User.email,
      designationTitle: item.Designation.designationTitle,
    };
    serializedData.push(user);
  });
  res.data = serializedData;
  next();
};

module.exports = {
  getAllWorkspace,
};
