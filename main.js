var offset = 0;

function ajaxRequest(params) {
  // $table.bootstrapTable('load', data)
  filters = {
    BenefitName: $("#BenefitName").val(),
    BusinessYear: $("#BusinessYear").val(),
    CoinsOutofNet: $("#CoinsOutofNet").val(),
    EHBVarReason: $("#EHBVarReason").val(),
    Explanation: $("#Explanation").val(),
    PlanId: $("#PlanId").val(),
    RowNumber: $("#RowNumber").val(),
    SourceName: $("#SourceName").val(),
    StandardComponentId: $("#StandardComponentId").val(),
    StateCode: $("#StateCode").val(),
    StateCode2: $("#StateCode2").val(),
    VersionNum: $("#VersionNum").val(),
  }

  $("#table").bootstrapTable('showLoading');

  if (params === {} || params == null) {
    params = {
      "offset": 0
    }
  } else {

    params = params.data || {
      "offset": 0
    };
  }

  if (params.offset === 0 || params.offset == null) {
    $("#prev-btn").attr("disabled", true);

  }
  fetch('http://localhost:5000/filter', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      filters: filters,
      params: params
    }),
  }).then((response) => {

    // Convert the response data to JSON
    response.json().then((data) => {
      if (data.length === 0) {
        $("#next-btn").attr("disabled", true);
        offset = offset - 1;
      }
      $("#table").bootstrapTable('load', data);
      $("#table").bootstrapTable('hideLoading');
      setTimeout(function () {
        //do what you need here
        $("#BenefitName").val(filters.BenefitName);
        $("#BusinessYear").val(filters.BusinessYear);
        $("#CoinsOutofNet").val(filters.CoinsOutofNet);
        $("#EHBVarReason").val(filters.EHBVarReason);
        $("#Explanation").val(filters.Explanation);
        $("#PlanId").val(filters.PlanId);
        $("#RowNumber").val(filters.RowNumber);
        $("#SourceName").val(filters.SourceName);
        $("#StandardComponentId").val(filters.StandardComponentId);
        $("#StateCode").val(filters.StateCode);
        $("#StateCode2").val(filters.StateCode2);
        $("#VersionNum").val(filters.VersionNum);
      }, 500);
    })
  })



}
$("#search-btn").click(function (event) {
  ajaxRequest(null);
  $("#prev-btn").attr("disabled", true);

  offset = 0;
});

$("#prev-btn").click(function (event) {
  $("#next-btn").attr("disabled", false);
  if (offset === 0) {
    $(this).attr("disabled", true);
  } else {
    offset = offset - 1;

    ajaxRequest({
      "offset": offset
    });
  }

});

$("#next-btn").click(function (event) {
  $("#prev-btn").attr("disabled", false);

  offset = offset + 1;
  ajaxRequest({
    "offset": offset
  });

});



$("#search-btn").click(function (event) {
  $("#prev-btn").attr("disabled", true);

  ajaxRequest({});
  offset = 0;
});

$("#reset-btn").click(function (event) {
  offset = 0;
  $("#prev-btn").attr("disabled", true);
  $("#BenefitName").val("");
  $("#BusinessYear").val("");
  $("#CoinsOutofNet").val("");
  $("#EHBVarReason").val("");
  $("#Explanation").val("");
  $("#PlanId").val("");
  $("#RowNumber").val("");
  $("#SourceName").val("");
  $("#StandardComponentId").val("");
  $("#StateCode").val("");
  $("#StateCode2").val("");
  $("#VersionNum").val("");

  ajaxRequest({});

});