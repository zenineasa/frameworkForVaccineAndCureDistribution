parentFolder = 'Results/';
folders = dir('Results');
filename = 'simResults.xlsx';

for i = 3:length(folders)
    plotToFile([parentFolder folders(i).name '/'], filename);
end
