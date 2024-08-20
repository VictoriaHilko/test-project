
const DailyNormaModal: = ({ setVisible, onWaterAmountSave }) => {
  const { t } = useTranslation();


  const waterRateMG = useSelector(selectWaterRate);
  let waterRate = (waterRateMG && waterRateMG / 1000) || 2.0;

  const [userData, setUserData] = useState({
    gender: "female",
    weight: "",
    activityTime: "",
    waterAmount: "",
  });

  const initialValues = {
    gender: "female",
    weight: "",
    activityTime: "",
    waterAmount: waterRate.toString(),
  };

  const validationSchema = Yup.object({
    weight: Yup.number().min(1, `${t("dailyNormaModal.errors.min1")}`),
    activityTime: Yup.number().min(0, `${t("dailyNormaModal.errors.min0")}`),
    waterAmount: Yup.number()
      .required(`${t("dailyNormaModal.errors.waterAmountReq")}`)
      .min(0.1, `${t("dailyNormaModal.errors.minWater0")}`)
      .max(15, `${t("dailyNormaModal.errors.maxWater")}`),
  });

  const [neededWaterAmount, setNeededWaterAmount] = useState(2.0);

  useEffect(() => {
    // Set the initial value for waterAmount when the component mounts
    setUserData((prevData) => ({
      ...prevData,
      waterAmount: waterRate.toString(),
    }));
  }, [waterRate]);

  // Recalculate neededWaterAmount when gender changes
  useEffect(() => {
    const calculatedWaterAmount = calculateWaterAmount(
      userData.gender,
      Number(userData.weight),
      Number(userData.activityTime)
    );
    setNeededWaterAmount(Number(calculatedWaterAmount));

    

  }, [userData.gender, userData.weight, userData.activityTime]);

  const calculateWaterAmount = (
    gender: string,
    weight: number,
    activityTime: number
  ): string => {
    if (gender === "female") {
      return (weight * 0.03 + activityTime * 0.4).toFixed(1);
    } else {
      return (weight * 0.03 + activityTime * 0.6).toFixed(1);
    }
  };

  const onSubmit = (values: any, { resetForm }: any) => {
    setUserData((prevData) => ({
      ...prevData,
      waterAmount: values.waterAmount,
    }));

    const waterAmount = values.waterAmount;

    const calculatedWaterAmount = calculateWaterAmount(
      values.gender,
      values.weight,
      values.activityTime
    );

    setNeededWaterAmount(Number(calculatedWaterAmount));

    onWaterAmountSave(parseFloat(waterAmount) * 1000);

    dispatch(updateWaterNormaThunk((waterAmount * 1000).toString()));
    dispatch(getAllWaterForTodayThunk());

    document.body.classList.remove("body-scroll-lock");
    setVisible(false);
  };

  return (
    <div className={css.container}>
      
      </div>

  );

  }